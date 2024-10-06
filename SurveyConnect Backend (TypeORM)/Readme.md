# TypeScript with TypeORM and MySQL Starter

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up MySQL Database**

   - **Using Docker (Recommended)**
     Run the following command to start MySQL using Docker Compose:
     ```bash
     docker-compose up -d
     ```

   - **Without Docker**
     Ensure you have a MySQL server running locally. Update the database connection settings in the `.env` file.

3. **Create .env File**

   Create a new file named `.env` in the root of your project and configure the environment variables:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=root
   DB_NAME=your_database_name
   ```

4. **Build and Run**

   ```bash
   # To convert TypeScript to JavaScript
   npm run build

   # To start the server
   npm rundev
   ```

## Additional Scripts

- **Run Prettier for Code Formatting:**
  ```bash
  npm run format
  ```

- **Check for Linting Errors:**
  ```bash
  npm run lint
  ```

- **Automatically Fix Fixable Issues:**
  ```bash
  npm run lint:fix
  ```

## Notes

- Make sure to update the `.env` file with appropriate database connection details.
- The `npm rundev` command is used to start the server in development mode with auto-reloading.

Feel free to explore and modify the project based on your requirements! If you encounter any issues, refer to the documentation of [TypeORM](https://typeorm.io) and [MySQL](https://dev.mysql.com/doc/).




// To Create the Migration File

typeorm migration:create -n ChangeUserTable --dir src/database/migrations

// To Run the Migration File

npx typeorm-ts-node-commonjs migration:run --dataSource=src/database/orm.config.ts
