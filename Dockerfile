FROM rust:latest
WORKDIR /usr/src/shard
RUN cargo install cargo-watch
COPY . .
CMD exec cargo watch -x run