const createUsageSeed = () => {
    const timestamp = new Date().toISOString();

    return [
        {
            id: 1,
            subscriberId: 'SUB01',
            callMinutes: 40,
            smsCount: 10,
            dataUsageMB: 1500,
            timestamp,
        },
        {
            id: 2,
            subscriberId: 'SUB02',
            callMinutes: 90,
            smsCount: 20,
            dataUsageMB: 6000,
            timestamp,
        },
        {
            id: 3,
            subscriberId: 'SUB01',
            callMinutes: 35,
            smsCount: 8,
            dataUsageMB: 1200,
            timestamp,
        },
    ];
};

module.exports = { createUsageSeed };
