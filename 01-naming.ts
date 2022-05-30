// 01.
const unmountAbortControllerRef = useRef<AbortController>(new AbortController());

// 02.
const handleEscKeyUp = useCallback(
    (evt: KeyboardEvent) => {
        if (evt.key === "Escape") {
            setIsMenuOpened(false);
        }
    },
    [setIsMenuOpened]
);

// 03.
const [mounted, setMounted] = useState(false);

// 04.
const inputListener = () => {
    if (!active || !blurRef.current) {
        return;
    }

    inputRef.current?.focus();
};
// 05.
const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setLengthName(e.target.value.length);
};

// 06.
const inputDescriptionChangeHandler = (
    e: ChangeEvent<HTMLTextAreaElement>
) => {
    setLengthDescription(e.target.value.length);
};

// 07
const handleCategoriesData = (value: CategoriesList[]) => {
    setCategoriesData(value);
};
// 08.
const response = await authRequestMiddleware(req.cookies, res, async () => {
    return GuideService.getGuideById({
        id: id,
    });
});
// 09.
const sexOptions: SexOptions = [
    {
        label: "Мужчина",
        value: "male",
    },
    { label: "Женщина", value: "female" },
];

// 10

const dataPick = (dateValue: DateRange) => {
    setDateRange(dateValue);
};

// 11.
const updateIsRecordCreated = (): void => {
    setIsRecordCreated(!isRecordCreated);
};
// 12.

