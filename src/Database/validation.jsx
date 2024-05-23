const IsNumber = (str) => {
    return !isNaN(str);
}

const IsEmpty = (str) => {
    if (str.trim())
        return false;
    else
        return true;
}

const IsSelected = (str) => {
    if (IsEmpty(str) || str === '0')
        return false;
    else
        return true;
}

const IsNegativeNum = (str) => {
    return 0 > parseInt(str);
}

const IsEmail = (str) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
}

const IsPhone = (str) => {
    const phoneRegex = /^\d{10}$/; // Assumes phone number is exactly 10 digits
    return phoneRegex.test(str);
}

const ToBoolean = (str) => {
    return 'true' === str.toLowerCase();
}


const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const formattedDate = dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const formattedTime = dateTime.toLocaleTimeString('en-GB', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${formattedDate} ${formattedTime}`;
};

export { IsEmpty, IsNumber, IsNegativeNum, IsSelected, IsEmail, IsPhone, ToBoolean, formatDateTime }