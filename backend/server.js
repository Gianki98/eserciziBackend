function luckyDraw(player) {
  return new Promise((resolve, reject) => {
    const win = Boolean(Math.round(Math.random()));
    process.nextTick(() => {
      if (win) resolve(`${player} won a prize in the draw!`);
      else reject(new Error(`${player} lost the draw.`));
    });
  });
}


const play = (player) =>
  luckyDraw(player)
    .then((msg) => console.log(msg))
    .catch((err) => console.error(err.message));


play("Joe")
  .then(() => play("Caroline"))
  .then(() => play("Sabrina"));
