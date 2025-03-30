// DOM Elements
const eventsList = document.getElementById('events-list');
const myEventsList = document.getElementById('my-events-list');
const eventSearch = document.getElementById('event-search');
const eventCategoryFilter = document.getElementById('event-category-filter');
const createEventBtn = document.getElementById('create-event-btn');
const newEventBtn = document.getElementById('new-event-btn');
const eventModal = document.getElementById('event-modal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    createEventBtn?.addEventListener('click', () => {
        if (app.currentUser()) {
            renderEventForm();
            app.openModal('event-modal');
        } else {
            alert('Please login as an organizer to create events.');
            app.openModal('login-modal');
        }
    });

    newEventBtn?.addEventListener('click', () => {
        renderEventForm();
        app.openModal('event-modal');
    });

    eventSearch?.addEventListener('input', debounce(loadEvents, 300));
    eventCategoryFilter?.addEventListener('change', loadEvents);
});

// Render Event Form
function renderEventForm(event = null) {
    const isEdit = event !== null;

    eventModal.innerHTML = `
        <div class="modal-content animate-pop">
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit' : 'Create'} Event</h3>
                <button class="close-btn">&times;</button>
            </div>
            <form id="event-form">
                <input type="hidden" id="event-id" value="${isEdit ? event.id : ''}">
                <div class="form-group">
                    <label for="event-title" class="form-label">Title</label>
                    <input type="text" id="event-title" class="form-control" value="${isEdit ? event.title : ''}" required>
                </div>
                <div class="form-group">
                    <label for="event-description" class="form-label">Description</label>
                    <textarea id="event-description" class="form-control" rows="3" required>${isEdit ? event.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="event-category" class="form-label">Category</label>
                    <select id="event-category" class="form-control" required>
                        <option value="">Select Category</option>
                        <option value="CONFERENCE" ${isEdit && event.category === 'CONFERENCE' ? 'selected' : ''}>Conference</option>
                        <option value="WORKSHOP" ${isEdit && event.category === 'WORKSHOP' ? 'selected' : ''}>Workshop</option>
                        <option value="SEMINAR" ${isEdit && event.category === 'SEMINAR' ? 'selected' : ''}>Seminar</option>
                        <option value="CELEBRATION" ${isEdit && event.category === 'CELEBRATION' ? 'selected' : ''}>Celebration</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="event-date" class="form-label">Date & Time</label>
                    <input type="datetime-local" id="event-date" class="form-control" value="${isEdit ? formatDateTimeForInput(event.dateTime) : ''}" required>
                </div>
                <div class="form-group">
                    <label for="event-slots" class="form-label">Maximum Slots</label>
                    <input type="number" id="event-slots" class="form-control" min="1" value="${isEdit ? event.maxSlots : '50'}" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-block">${isEdit ? 'Update' : 'Create'} Event</button>
                    ${isEdit ? `<button type="button" id="cancel-event-btn" class="btn btn-danger btn-block mt-1">Cancel Event</button>` : ''}
                </div>
            </form>
        </div>
    `;

    // Add form submit handler
    document.getElementById('event-form').addEventListener('submit', isEdit ? handleUpdateEvent : handleCreateEvent);

    // Add cancel event handler if editing
    if (isEdit) {
        document.getElementById('cancel-event-btn').addEventListener('click', handleCancelEvent);
    }

    // Close button
    eventModal.querySelector('.close-btn').addEventListener('click', () => {
        app.closeModal('event-modal');
    });
}

// Event Loading
async function loadEvents() {
    app.showLoading();
    eventsList.innerHTML = '';

    try {
        const searchTerm = eventSearch.value;
        const category = eventCategoryFilter.value;

        let url = '/events/available';
        if (searchTerm || category) {
            url += `?search=${searchTerm}&category=${category}`;
        }

        const events = await app.fetchWithAuth(url);

        if (events.length === 0) {
            eventsList.innerHTML = '<p class="text-center">No events found.</p>';
            return;
        }

        events.forEach(event => {
            const eventElement = createEventCard(event);
            eventsList.appendChild(eventElement);
        });
    } catch (error) {
        eventsList.innerHTML = '<p class="text-center">Failed to load events. Please try again.</p>';
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

async function loadMyEvents() {
    app.showLoading();
    myEventsList.innerHTML = '';

    try {
        const events = await app.fetchWithAuth('/events/my-events');

        if (events.length === 0) {
            myEventsList.innerHTML = '<p class="text-center">You haven\'t created any events yet.</p>';
            return;
        }

        events.forEach(event => {
            const eventElement = createEventCard(event, true);
            myEventsList.appendChild(eventElement);
        });
    } catch (error) {
        myEventsList.innerHTML = '<p class="text-center">Failed to load your events. Please try again.</p>';
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

// Event Card Creation
function createEventCard(event, isOrganizerView = false) {
    const card = document.createElement('div');
    card.className = 'card animate-fade-in';

    const date = new Date(event.dateTime);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    card.innerHTML = `
        <div class="card-body">
            <h3 class="card-title">${event.title}</h3>
            <p class="card-text">${event.description}</p>
            <div class="card-meta mt-2">
                <span class="badge">${event.category}</span>
                <span>${formattedDate}</span>
            </div>
            <div class="card-meta mt-1">
                <span>Slots: ${event.availableSlots}/${event.maxSlots}</span>
                ${event.isCancelled ? '<span class="badge danger">CANCELLED</span>' : ''}
                ${event.isClosed ? '<span class="badge warning">FULL</span>' : ''}
            </div>
        </div>
        <div class="card-footer">
            ${isOrganizerView ? `
                <button class="btn btn-outline edit-event-btn" data-id="${event.id}">Edit</button>
                ${!event.isCancelled ? `<button class="btn btn-danger cancel-event-btn" data-id="${event.id}">Cancel</button>` : ''}
            ` : `
                ${!event.isCancelled && !event.isClosed ?
                    `<button class="btn btn-primary book-event-btn" data-id="${event.id}">Book Now</button>` :
                    '<button class="btn btn-outline" disabled>Not Available</button>'
                }
            `}
        </div>
    `;

    // Add event listeners
    if (isOrganizerView) {
        card.querySelector('.edit-event-btn')?.addEventListener('click', () => handleEditEvent(event));
        card.querySelector('.cancel-event-btn')?.addEventListener('click', () => handleCancelEvent(event.id));
    } else {
        card.querySelector('.book-event-btn')?.addEventListener('click', () => handleBookEvent(event.id));
    }

    return card;
}

// Event Handlers
async function handleCreateEvent(e) {
    e.preventDefault();
    app.showLoading();

    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        category: document.getElementById('event-category').value,
        dateTime: document.getElementById('event-date').value,
        maxSlots: parseInt(document.getElementById('event-slots').value)
    };

    try {
        await app.fetchWithAuth('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        app.closeModal('event-modal');
        loadMyEvents();
        alert('Event created successfully!');
    } catch (error) {
        alert('Failed to create event. Please try again.');
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

async function handleEditEvent(event) {
    renderEventForm(event);
    app.openModal('event-modal');
}

async function handleUpdateEvent(e) {
    e.preventDefault();
    app.showLoading();

    const eventId = document.getElementById('event-id').value;
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        category: document.getElementById('event-category').value,
        dateTime: document.getElementById('event-date').value,
        maxSlots: parseInt(document.getElementById('event-slots').value)
    };

    try {
        await app.fetchWithAuth(`/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });

        app.closeModal('event-modal');
        loadMyEvents();
        alert('Event updated successfully!');
    } catch (error) {
        alert('Failed to update event. Please try again.');
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

async function handleCancelEvent(eventId) {
    if (!confirm('Are you sure you want to cancel this event?')) return;

    app.showLoading();

    try {
        await app.fetchWithAuth(`/events/${eventId}`, {
            method: 'DELETE'
        });

        app.closeModal('event-modal');
        loadMyEvents();
        alert('Event cancelled successfully!');
    } catch (error) {
        alert('Failed to cancel event. Please try again.');
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

async function handleBookEvent(eventId) {
    if (!app.currentUser()) {
        alert('Please login to book events.');
        app.openModal('login-modal');
        return;
    }

    if (!confirm('Confirm booking for this event?')) return;

    app.showLoading();

    try {
        await app.fetchWithAuth(`/bookings/${eventId}`, {
            method: 'POST'
        });

        loadEvents();
        alert('Booking confirmed!');
    } catch (error) {
        alert('Failed to book event. ' + (error.message.includes('No available slots') ? 'Event is full.' : 'Please try again.'));
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

// Helper Functions
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function formatDateTimeForInput(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
}