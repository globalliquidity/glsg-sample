const log = (content: any, value?: any) => {
    const isEnabled = true;

    if (isEnabled) {
        console.log(content || '', value || '');
    }
};

export default {
    log
};
