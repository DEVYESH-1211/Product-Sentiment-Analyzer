# Use Python 3.11
FROM python:3.11-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Chromium and required libraries
RUN apt-get update && apt-get install -y \
    chromium \
    wget \
    curl \
    unzip \
    xvfb \
    fonts-liberation \
    libglib2.0-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libxshmfence1 \
    libu2f-udev \
    libvulkan1 \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Let Selenium know where Chromium is
ENV CHROME_BIN=/usr/bin/chromium

# Working directory
WORKDIR /app

# Copy requirements first (better Docker caching)
COPY requirements.txt .

# Upgrade pip
RUN pip install --upgrade pip

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK resources
RUN python -c "import nltk; nltk.download('vader_lexicon')"

# Copy project files
COPY . .

# Render provides PORT; default to 5000 for local use
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Start Gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --timeout 120 app:app"]