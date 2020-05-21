const log = (content: any, value?: any) => {
    const isEnabled = false;

    if (isEnabled) {
        console.log(content || '', value || '');
    }
};

export default {
    log
};
