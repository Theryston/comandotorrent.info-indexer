# Comandotorrent.info Indexer

This is a simple but very useful project that when you run it will index all the content (tv shows and movies) from the website [https://comandotorrent.info](https://comandotorrent.info) into a sqlite file. 

It's easy to run and you can check it out how [here](#run). But if you only need the data, just download the `Database.sqlite3` file from the [latest release](https://github.com/Theryston/comandotorrent.info-indexer/releases/latest).

## Run

- First, just clone the git project

- Install the dependencies with `pnpm`:

```bash
pnpm i
```

- Run the migrations:

```bash
pnpm migration:run
```

- Create a `.env` file like the `.env.example` file

- Run the process:

```bash
pnpm start
```

Just wait and a file called `Database.sqlite3` will be created! When the process ends this file will have all the indexed content.
