function luckyDraw(player) {
  return new Promise((resolve, reject) => {
    const win = Boolean(Math.round(Math.random()));
    process.nextTick(() => {
      if (win) resolve(`${player} won a prize in the draw!`);
      else reject(new Error(`${player} lost the draw.`));
    });
  });
}

async function getResults() {
  const players = ["Tina", "Jorge", "Julien"];

  for (const p of players) {
    try {
      const msg = await luckyDraw(p);
      console.log(msg);
    } catch (err) {
      console.error(err.message);
    }
  }
}

// avvio
getResults();
