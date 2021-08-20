import { database } from "./userscript";

export function handleReviewCompleted(id: string, data: [number, number | ""]) {
  const item = database.get(id);

  if (item === undefined) {
    return;
  }

  let srs = item.reviewData.srs;
  let incorrectMeaning = data[0] ?? 0;
  let incorrectReading = data[1] ?? 0;
  if (incorrectReading == "") {
    incorrectReading = 0;
  }
  const incorrectAmount = incorrectMeaning + incorrectReading;

  if (incorrectAmount === 0 || srs === 0) {
    srs++;
    if (srs === 9) {
      item.reviewData.burned = true;
    }
  } else {
    let stepsDown = Math.ceil(incorrectAmount / 2);

    while (stepsDown > 0 && srs > 1) {
      srs -= srs >= 5 ? 2 : 1;
      stepsDown--;
    }
  }

  item.reviewData.srs = srs;

  item.reviewData.due_date = calculateNextDueDate(item.reviewData.srs);
  database.save();
}

export function handleLessonCompleted(id: string) {
  const item = database.get(id);

  if (item === undefined) {
    return;
  }

  item.reviewData.srs = 1;

  item.reviewData.due_date = calculateNextDueDate(item.reviewData.srs);
  database.save();
}

const millisecondsInHour = 60 * 60 * 1000;

function calculateNextDueDate(srs: number) {
  return new Date(
    Math.floor(new Date().getTime() / millisecondsInHour) * millisecondsInHour +
      getSrsInterval(srs)
  );
}

function getSrsInterval(srs: number) {
  const hours = [0, 4, 8, 23, 47, 167, 335, 719, 2879];

  return (hours[srs] ?? 0) * millisecondsInHour;
}
