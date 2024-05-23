export const Person = {
    Name: null,
    eDesignation: null,
    Email: null,
    InstituteId: null,
    ContactNo: null,
    InsertTime: null,
    UpdateTime: null
}

export const Login = {
    PersonId: null,
    username: null,
    password: null,
    IsAllowLogin: null,
    InsertTime: null,
    UpdateTime: null
}

export const LoginLog = {
    username: null,
    password: null,
    eLoginStatus: null,
    Message: null,
    Device: null,
    LoginTime: null
}

export const Institute = {
    PersonId: null,
    InsertTime: null
}

export const Course = {
    Name: null,
    SerialNo: null,
    eCourseType: null,
    ParentId: null,
    InstituteId: null,
}

// export const Subject = {
//     Name: null,
//     SubjectCode: null,
//     CourseId: null,
//     eStatus: null,
//     InsertTime: null,
//     UpdateTime: null
// }

export const FacultySubject = {
    PersonId: null,
    SubjectId: null,
    eStatus: null
}

export const Student = {
    RollNo: null,
    CourseId: null,
    PersonId: null,
    UpdateTime: null
}

export const ProjectGroup = {
    GroupName: null,
    SerialNo: null,
    MaxStudent: null,
    EndDate: null,
    SectionId: null,
    InsertPersonId: null,
    UpdatePersonId: null,
    UpdateTime: null
}

export const ProjectField = {
    ProjectGroupId: null,
    FieldName: null,
    eFieldType: null,
    SerialNo: null,
    EndTime: null,
    IsCompulsory: null,
    InsertPersonId: null,
    UpdatePersonId: null,
    UpdateTime: null
}

export const Team = {
    ProjectName: null,
    ProjectGroupId: null,
    LeaderPersonId: null,
    TotalStudents: null,
    GuidePersonId: null,
    InsertPersonId: null,
    InsertTime: null,
    UpdatePersonId: null,
    UpdateTime: null
}

export const TeamStudent = {
    TeamId: null,
    PersonId: null,
    ProjectGroupId: null,
    InsertPersonId: null,
    InsertTime: null
}

export const TeamData = {
    TeamId: null,
    FieldId: null,
    Answer: null,
    FilePath: null,
    InsertPersonId: null,
    InsertTime: null,
    UpdatePersonId: null,
    UpdateTime: null
}

export const Notifications = {
    SenderPersonId: null,
    ReceiverPersonId: null,
    GroupId: null,
    Message: null,
    IsReceived: null,
    InsertTime: null
}

export const dbCollections = {
    Institute: 'Institute',
    Login: 'login',
    Person: 'Person',
    LoginLog: 'LoginLog',
    Course: 'Course',
    FacultySubject: 'FacultySubject',
    Student: 'Student',
    ProjectGroup: 'ProjectGroup',
    ProjectField: 'ProjectField',
    Team: 'Team',
    TeamStudent: 'TeamStudent',
    TeamData: 'TeamData',
    Notifications: 'Notifications'
}