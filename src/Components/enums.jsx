const eDesignation = {
    SupAdmin: 1,
    Admin: 2,
    Faculty: 3,
    Student: 4
};

const eLoginStatus = {
    Fail: 0,
    Success: 1
}

const eCourse = {
    Branch: 1,
    Semester: 2,
    Section: 3,
    Subject: 4
}

const eFieldType = {
    Textbox: 1,
    Fileupload: 2,
}

const eMsg = {
    Success: 1,
    Info: 2,
    Error: 3
}

export { eDesignation, eLoginStatus, eCourse, eFieldType, eMsg };

export function GetEnumName(Enum, value) {
    return Object.keys(Enum).find(key => Enum[key] === value);
}