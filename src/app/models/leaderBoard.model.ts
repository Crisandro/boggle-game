export class LeaderBoard {
  constructor(
    public name: string,
    public score: number,
    public words: Array<string>,
    public createdAt?: CreatedAt
  ) {}
}

export class CreatedAt {
  constructor(
    public _seconds?: number,
    public _nanoseconds?: number
  ) {}
}