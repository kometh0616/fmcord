export default class RandomArray<T> extends Array<T> {

    public constructor(...args: T[]) {
        super(...args);
    }

    get random(): T {
        return this[Math.floor(Math.random() * this.length)];
    }
    
}