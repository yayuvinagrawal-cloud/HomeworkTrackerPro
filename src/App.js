/**
 * App.js - Core Logic & Data Management
 */

export let assignments = JSON.parse(localStorage.getItem('focusHomework')) || [];

export const saveToDisk = () => {
    localStorage.setItem('focusHomework', JSON.stringify(assignments));
};

export const addAssignment = (title, subject, dueDate) => {
    const newAssignment = {
        id: Date.now(),
        title,
        subject,
        dueDate,
        completed: false
    };
    assignments.push(newAssignment);
    saveToDisk();
};

export const toggleTask = (id) => {
    assignments = assignments.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveToDisk();
};

export const deleteTask = (id) => {
    assignments = assignments.filter(task => task.id !== id);
    saveToDisk();
};

export const getSortedAssignments = () => {
    return [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};
