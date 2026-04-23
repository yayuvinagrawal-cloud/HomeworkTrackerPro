/**
 * index.js - DOM Manipulation & Event Listeners
 */
import { assignments, addAssignment, toggleTask, deleteTask, getSortedAssignments } from './App.js';

const hwForm = document.querySelector('#hw-form');
const hwList = document.querySelector('#hw-list');
const taskCount = document.querySelector('#task-count');

function updateUI() {
    const sorted = getSortedAssignments();
    hwList.innerHTML = '';
    
    const remaining = sorted.filter(t => !t.completed).length;
    taskCount.innerText = `${remaining} task${remaining === 1 ? '' : 's'} to focus on`;

    sorted.forEach(task => {
        const isOverdue = !task.completed && task.dueDate < new Date().toISOString().split('T')[0];
        
        const li = document.createElement('li');
        li.className = `hw-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-info">
                <span class="subject-tag">${task.subject}</span>
                <strong class="${isOverdue ? 'overdue' : ''}">${task.title}</strong>
                <p>Due: ${task.dueDate}</p>
            </div>
            <div class="actions">
                <button class="btn-done" data-id="${task.id}">${task.completed ? '↩️' : 'Done'}</button>
                <button class="btn-del" data-id="${task.id}">🗑️</button>
            </div>
        `;
        hwList.appendChild(li);
    });
}

// Event Listeners
hwForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.querySelector('#hw-input').value;
    const subject = document.querySelector('#subject-input').value;
    const date = document.querySelector('#date-input').value;
    
    addAssignment(title, subject, date);
    updateUI();
    hwForm.reset();
});

hwList.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains('btn-done')) toggleTask(id);
    if (e.target.classList.contains('btn-del')) deleteTask(id);
    updateUI();
});

// Dynamic Greeting
const hour = new Date().getHours();
const greetingText = hour < 12 ? "Good Morning." : hour < 18 ? "Good Afternoon." : "Good Evening.";
document.querySelector('#user-greeting').innerText = greetingText;

// Initial Load
updateUI();
