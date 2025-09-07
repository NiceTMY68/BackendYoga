const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./yoga.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS YogaClasses (
        classId INTEGER PRIMARY KEY AUTOINCREMENT,
        dayOfWeek TEXT NOT NULL,
        startTime TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        price REAL NOT NULL,
        classType TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Teachers (
        teacherId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Sessions (
        sessionId INTEGER PRIMARY KEY AUTOINCREMENT,
        classId INTEGER,
        teacherId INTEGER,
        sessionDate DATE NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES YogaClasses(classId),
        FOREIGN KEY (teacherId) REFERENCES Teachers(teacherId)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Customers (
        customerId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Bookings (
        bookingId INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId INTEGER,
        customerId INTEGER,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sessionId) REFERENCES Sessions(sessionId),
        FOREIGN KEY (customerId) REFERENCES Customers(customerId)
    )`);

    console.log('All tables created successfully');
}

module.exports = db;
