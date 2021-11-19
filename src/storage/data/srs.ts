export enum SRSStages {
  Initiate = 0,
  Apprentice1 = 1,
  Apprentice2 = 2,
  Apprentice3 = 3,
  Apprentice4 = 4,
  Guru1 = 5,
  Guru2 = 6,
  Master = 7,
  Enlightened = 8,
  Burned = 9,
}

export class SRSData {
  srs = SRSStages.Initiate;
  due_date: Date | undefined;

  public isDue(): boolean {
    return this.due_date === undefined || this.due_date.getDate() < Date.now();
  }

  public isLesson(): boolean {
    return false;
    // return this.srs === SRSStages.Initiate;
  }

  public isReview(): boolean {
    return !this.isLesson();
  }

  public handleReviewed(failures: number): void {
    const stepDowns = Math.ceil(failures / 2);

    for (let i = 0; i < stepDowns; i++) {
      if (this.srs <= 1) {
        break;
      }

      if (this.srs >= SRSStages.Guru1) {
        this.srs -= 2;
      } else {
        this.srs--;
      }
    }

    this.recalculateDueDate();
  }

  private recalculateDueDate(): void {}
}
