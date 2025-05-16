# Desafio Fullstack Mérito

Flávio Micheletti

Eu fiz o projeto no final de semana de 10 e 11 de Maio.


## Execute primeiro o banco de dados

    cd ./
    docker-compose up --build


Se, por um acaso, precisar resetar o "volume":

    // Parar e remover containers
    docker-compose down
    // Listar volumes
    docker volume ls
    // Remover o volume pgdata
    docker volume rm desafio-fullstack-merito_pgdata


## Execute o Back-end

    cd ./backend
    python3 -m venv .venv && . .venv/bin/activate
    python -m app.main

Veja mais detalhes no arquivo [readme](backend/readme.md).



## Execute o Front-end

    cd frontend
    npm install
    npm run dev
    
Acessar em:
    
    http://localhost:5173/


    