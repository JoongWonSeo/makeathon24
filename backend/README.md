# Backend

## Initial Setup

### Installation

Make sure [poetry](https://python-poetry.org/) is installed on your system. Then run the following command:

```bash
poetry install
```

If you want to avoid using poetry, you can also install the dependencies with pip:

```bash
pip install .
```

### Environment Variables

Copy the `.env.example` file to `.env` and fill in the values.

## Run the Backend Server

If you have poetry installed, you can run the server with the following command:

```bash
poetry run backend
```

Or to have auto-reload on save:

```bash
poetry run backend-dev
```

Then simply head to [http://localhost:9000](http://localhost:9000) to see the server running.
