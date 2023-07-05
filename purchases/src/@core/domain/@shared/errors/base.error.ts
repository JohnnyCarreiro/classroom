export class BaseError<T> extends Error {
  private _name: T

  constructor({ name, description }: { name: T; description: string }) {
    super(description)
    this._name = name
    Object.setPrototypeOf(this, BaseError.prototype)
    Error.captureStackTrace(this)
  }

  public get name(): string {
    return String(this._name)
  }

  public get errorName(): T {
    return this._name
  }

  public set errorName(errorName: T) {
    this.errorName = errorName
  }
}
