// DOM Elements
const bookingsList = document.getElementById('bookings-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (bookingsList) {
        // Load bookings when section is shown
        document.getElementById('my-bookings-link').addEventListener('click', loadMyBookings);
    }
});

// Load Bookings
async function loadMyBookings() {
    app.showLoading();
    bookingsList.innerHTML = '';

    try {
        const bookings = await app.fetchWithAuth('/bookings/my-bookings');

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p class="text-center">You have no bookings yet.</p>';
            return;
        }

        bookings.forEach(booking => {
            const bookingElement = createBookingCard(booking);
            bookingsList.appendChild(bookingElement);
        });
    } catch (error) {
        bookingsList.innerHTML = '<p class="text-center">Failed to load bookings. Please try again.</p>';
        console.error(error);
    } finally {
        app.hideLoading();
    }
}

// Booking Card Creation
function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'card animate-fade-in';

    const event = booking.event;
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
            <div class="card-meta">
                <span class="badge">${event.category}</span>
                <span>${formattedDate}</span>
            </div>
            <div class="card-meta mt-1">
                <span>Status: ${booking.isCancelled ? 'CANCELLED' : 'CONFIRMED'}</span>
                <span>Booked on: ${new Date(booking.bookedAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="card-footer">
            ${!booking.isCancelled && !event.isCancelled ?
                `<button class="btn btn-danger cancel-booking-btn" data-id="${booking.id}">Cancel Booking</button>` :
                ''
            }
        </div>
    `;

    // Add event listener
    card.querySelector('.cancel-booking-btn')?.addEventListener('click', () => handleCancelBooking(booking.id));

    return card;
}

// Booking Handlers
async function handleCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    app.showLoading();

    try {
        await app.fetchWithAuth(`/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        loadMyBookings();
        alert('Booking cancelled successfully!');
    } catch (error) {
        alert('Failed to cancel booking. Please try again.');
        console.error(error);
    } finally {
        app.hideLoading();
    }
}