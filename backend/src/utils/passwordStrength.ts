export function checkPasswordStrength(password: string): string {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    if (strongRegex.test(password)) {
        return 'strong';
    } else if (mediumRegex.test(password)) {
        return 'medium';
    } else {
        return 'weak';
    }
}