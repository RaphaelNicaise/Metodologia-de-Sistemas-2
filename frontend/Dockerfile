# Dockerfile para React + Vite
FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando por defecto para iniciar Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]