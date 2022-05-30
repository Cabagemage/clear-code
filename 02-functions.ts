// 01
export const makeupMainFormValidationErrors = (
    value: MakeupFormValues,
    mode: "creation" | "edit"
) => {
    let errors: string[] = [];

    if (!value.name || value.name.length < 5) {
        errors.push("Макияж: имя не указано либо его длина меньше 5 символов");
    }
    if (!value.description || value.description.length < 5) {
        errors.push("Макияж: описание не указано либо его длина меньше 5 символов");
    }
    if (!value.video && mode === "creation") {
        errors.push("Видео макияжа не указано");
    }
    if (!value.cover && mode === "creation") {
        errors.push("Фото макияжа не указано");
    }

    if (value.category === "Выберите категорию") {
        errors.push("Категория макияжа не указана");
    }
    if (errors.length) {
        showNotification("error", errors[0]);
    }
    return errors;
};

// 02
const thirdPartyExchangeToken = async () => {
    const redirectUri = JSON.stringify(localStorage.getItem("redirectUri"));
    const thirdPartySignInId = JSON.stringify(localStorage.getItem("thirdPartyAuthId"));
    try {
        if (query.code && typeof thirdPartySignInId !== "undefined") {
            const queryCode = Array.isArray(query.code) ? query.code.slice(-1).toString() : query.code!.toString();
            const {access_token, refresh_token, expires_in} = await AuthRequest.exchangeThirdPartySignInServiceCodeForAccessToken({
                thirdPartySignInService: JSON.parse(thirdPartySignInId),
                code: queryCode,
                redirectUri: JSON.parse(redirectUri),
            });
            const expire = new Date(new Date().getTime() + expires_in * 1000);
            storeAuthData(access_token, refresh_token, expire.toISOString(), remember);
            reload();
        }
    } catch (e) {
        setThirdPartyAuthFail(true);
    }
};
// 03
const validateForm = (values: IRegisterFormStateProps) => {
    let formErrors: {[key: string]: string} = {};
    const linkError = "Ссылка введена некорректно";

    const links = [
        {value: values.homepage, name: "homepage"},
        {value: values.chatbot, name: "chatbot"},
        {value: values.appStore, name: "appStore"},
        {value: values.yandex, name: "yandex"},
        {value: values.googlePlay, name: "googlePlay"},
        {value: values.vkMiniApp, name: "vkMiniApp"},
        {value: values.presentationValue, name: "presentationValue"},
    ];
    links.map((item) => {
        if (item.value && !item.value.match(regularExpressionForLink)) {
            formErrors[item.name] = linkError;
        }
    });

    if (values.serviceNameValue.length > 128) {
        formErrors.serviceNameValue = "Максимальная длина названия сервиса 128 символов";
    }
    if (values.serviceDescriptionValue && values.serviceDescriptionValue.length > 512) {
        formErrors.serviceDescriptionValue = "Максимальная длина описания сервиса составляет 512 символов";
    }
    if (values.contactsValue.length > 512) {
        formErrors.contactsValue = "Максимальная длина поля контактов 512 символов.";
    }
    if (values.additionalSocialRoleValue && values.additionalSocialRoleValue.length > 128) {
        formErrors.additionalSocialRoleValue = "Максимальная длина описания дополнительной социальной роли 128 символов.";
    }
    if (values.needsOfRoleValue && values.needsOfRoleValue.length > 512) {
        formErrors.needsOfRoleValue = "Максимальная длина описания потребностей составляет 512 символов";
    }
    if (values.howOftenNeedIsNeedValue && values.howOftenNeedIsNeedValue.length > 128) {
        formErrors.howOftenNeedIsNeedValue = "Максимальная длина данного поля составляет 128 символов";
    }
    if (values.conditionsValue && values.conditionsValue?.length > 128) {
        formErrors.conditionsValue = "Максимальная длина описания необходимых условий составляет 128 символов";
    }
    if (values.serviceIdeaValue && values.serviceIdeaValue.length > 512) {
        formErrors.serviceIdeaValue = "Максимальная длина описания идеи сервиса составляет 512 символов";
    }
    if (values.otherInfoValue && values.otherInfoValue.length > 512) {
        formErrors.otherInfoValue = "Максимальная длина описания остальной информации составяляет 512 символов";
    }
    return formErrors;
};

// 04

const handleSearchValueChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (typeof searchTimerRef.current === "number") {
        clearTimeout(searchTimerRef.current);
    }

    const value = e.target.value;
    setSearchValue(value);
    if (value.replaceAll(" ", "") === "") {
        return;
    }
    searchTimerRef.current = +setTimeout(async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        const resp: ISearchInputResultItemProps[] = await ProfileRequest.searchNotFavouritedServices({query: value, count: 10});

        resp.forEach((item) => {
            item.onClick = async () => {
                if (item.id) {
                    await ProfileRequest.addServiceToFavourite({serviceId: item.id});
                }
                fetchFavoriteServices();
                setSearchResults([]);
            };
        });
        setSearchResults(resp);

        setLoading(false);
    }, 1000);
};


// 05;
const updateCards = async (roleId: string, need: INeed | null, currentSort: SelectOptionProps, paginationOffset: number) => {
    const queries: TSearchCatalogCardsQueries = {
        paginationOffset: paginationOffset,
        paginationCount: PAGE_SIZE,
        sort: currentSort.value,
    };
    if (query.chatbot === "1") {
        queries.filterHasChatbotLink = query.chatbot;
    }
    if (roleId === allRolesButton.id) {
        delete queries.filterSocialRoleId;
    }
    if (roleId !== allRolesButton.id) {
        queries.filterSocialRoleId = roleId;

        if (need !== null) {
            queries.filterSocialNeedId = need.id;
        }
    }

    const apps = await ServicesRequest.searchCatalogCards(queries);
    if (paginationOffset !== 0) {
        //add loaded cards to previous array of cards
        const actualArrayWithLoadedApps = displayingCatalogCards.concat(apps);

        setDisplayingCatalogCards(actualArrayWithLoadedApps);
    } else {
        setDisplayingCatalogCards(apps);
    }
};

// 06;
async function request<T>(fn: () => Promise<T>): Promise<T | undefined> {
    let resp;
    try {
        resp = await fn();
    } catch (error) {
        logout();
    }
    return resp;
}
// 07;

const onAvatarInputChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files) {
        return;
    }
    const file = e.target.files[0];

    const urlJson = await FilesRequest.getFileUploadUrl({purpose: "user_avatar"});

    const constraints = Object.keys(urlJson.constraints);

    if (!constraints.includes(file.type)) {
        e.target.value = "";
        return;
    }

    if (urlJson.constraints[file.type].maxFileSize < file.size) {
        e.target.value = "";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const uplResp = await fetch(urlJson.url, {
        method: "POST",
        body: formData,
    });

    const uplJson = (await uplResp.json()) as {
        file: {
            url: string;
        };
        uploadedFileData: string;
    };

    await ProfileRequest.updateAvatar({avatar: uplJson.uploadedFileData});

    onUpdateProfile("avatarUrl", uplJson.file.url);

    if (authContext.setAvatar) {
        authContext.setAvatar(uplJson.file.url);
    }
};
