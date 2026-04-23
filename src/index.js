<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Focus | Homework Tracker</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-container">
        <header>
            <div class="greeting">
                <h1 id="user-greeting">Good Morning, Student</h1>
                <p id="date-display"></p>
            </div>
        </header>

        <section class="input-card">
            <form id="hw-form">
                <input type="text" id="hw-input" placeholder="What's next?" required>
                <div class="input-row">
                    <select id="subject-input">
                        <option value="General">General</option>
                        <option value="Math">Math</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                    </select>
                    <input type="date" id="date-input" required>
                    <button type="submit" id="add-btn">Add Task</button>
                </div>
            </form>
        </section>

        <main class="task-section">
            <div class="section-header">
                <h2>Upcoming Assignments</h2>
                <span id="task-count">0 tasks left</span>
            </div>
            <ul id="hw-list">
                </ul>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>
