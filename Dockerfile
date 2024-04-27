ARG PYTHON_VERSION=3.11.8
ARG NODE_VERSION=node:18-alpine

# Backend builder
FROM python:${PYTHON_VERSION} AS backend-builder

# We set the Python unbuffered environment variable.
# This allows for the output to be sent straight to terminal without buffering it first.
ENV PYTHONUNBUFFERED 1

# Install Poetry
RUN pip install --upgrade pip && \
    pip install poetry==1.7.0

# Set the working directory in the container
WORKDIR /app/backend/

# Copy the poetry.lock and pyproject.toml files from host to the container
COPY backend/pyproject.toml backend/poetry.lock /app/backend/

# Set Poetry to create the virtualenv in the project's root (this will create a .venv directory)
RUN poetry config virtualenvs.in-project true && poetry config virtualenvs.create true

# Disable pip and setuptools installation in the virtualenv
RUN poetry config virtualenvs.options.no-pip true && poetry config virtualenvs.options.no-setuptools true

# Set the cache directory for the pip
RUN poetry config cache-dir /python-packages-cache

# Install the Python dependencies
RUN --mount=type=cache,target=/python-packages-cache poetry install --no-interaction --no-ansi --no-root

# Copy the rest of the code from the host to the backend-builder container
COPY backend/ /app/backend/

RUN --mount=type=cache,target=/python-packages-cache poetry install --no-interaction --no-ansi --no-root



# Frontend builder
FROM ${NODE_VERSION} AS frontend-builder

# Set the working directory in the container
WORKDIR app/frontend/

# Copy the package.json and package-lock.json files from host to the container
COPY frontend/package*.json /app/frontend

# Install the Node.js dependencies
RUN npm install

# Copy the rest of the code from the host to the frontend-builder container
COPY frontend /app/frontend

# Build the frontend code
RUN npm run build



FROM python:${PYTHON_VERSION}-slim AS local

ARG UID
ARG GID

RUN if getent group $GID ; then echo 'group exists' ; else groupadd -g $GID container-user; fi && \
    if id $UID ; then echo 'user exists' ; else useradd -m -u $UID -g $GID container-user; fi

USER $UID
WORKDIR /app/backend

# NLTK uses this directory to store the downloaded data
RUN mkdir -p /nltk_data && chown -R $UID:$GID /nltk_data && chmod -R 777 /nltk_data

# Copy the .venv, and set up any dependencies that need to be installed in the local container
COPY --from=backend-builder /app/backend/.venv /app/backend/.venv

# Set environment variables to ensure Python uses the packages from the app/backend/.venv directory
ENV PATH="/app/backend/.venv/bin:$PATH"
ENV PYTHONPATH="/app/backend/.venv/lib/python3.11/site-packages"

# pre-download the nltk data
RUN python -m nltk.downloader -d /nltk_data punkt averaged_perceptron_tagger

# Copy the compiled frontend code and the rest of the code from the backend-builder and frontend-builder containers to the local container
COPY --from=backend-builder /app/backend /app/backend
COPY --from=frontend-builder /app/frontend/out /app/frontend/out
COPY --from=frontend-builder /app/frontend /app/frontend

# Create the storage directory with the correct permissions
RUN mkdir -p storage/qdrant && chown -R $UID:$GID storage/qdrant && chmod -R 777 storage/qdrant

# Run the backend server
CMD ["python", "-m", "uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]
