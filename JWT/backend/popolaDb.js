import db from "./db.js";

async function start() {
  try {
    await db.tx(async (t) => {
      await t.none(`
        drop table if exists users;
        
        create table users (
        id serial not null primary key,
        username text not null,
        password text not null,
        token text 
        )
        `);
      await t.none(`
        insert into users (username, password) values ('carlo','123') 
        `);
    });
    console.log("Operazione completata");
  } catch (err) {
    console.log(err);
  }
}

start().catch((error) => console.error(error));
