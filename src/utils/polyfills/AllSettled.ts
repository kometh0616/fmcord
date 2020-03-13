export interface ResolvedPromise<T> {
    status: `fulfilled` | `rejected`;
    value?: T;
    reason?: unknown;
}

export default <T>(arr: Promise<T>[]): Promise<Array<ResolvedPromise<T>>> => {
    const promises = arr.map(x => Promise.resolve(x)
        .then(
            value => ({ status: `fulfilled`, value }) as ResolvedPromise<T>,
            reason => ({ status: `rejected`, reason }) as ResolvedPromise<T>
        )
    );
    return Promise.all(promises);
};