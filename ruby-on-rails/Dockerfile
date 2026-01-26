FROM ruby:3.0.4

RUN apt-get update -qq && \
  apt-get install -y --no-install-recommends ca-certificates curl gnupg && \
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get install -y --no-install-recommends nodejs && \
  rm -rf /var/lib/apt/lists/*

RUN npm install --global yarn@1.22.19

WORKDIR /samplerails

COPY Gemfile Gemfile.lock /samplerails/

RUN bundle install

CMD ["rails", "server", "-b", "0.0.0.0"]
