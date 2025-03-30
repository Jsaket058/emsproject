package com.example.emsproject.service;

import com.example.emsproject.entity.Booking;
import com.example.emsproject.entity.Event;
import com.example.emsproject.entity.User;
import com.example.emsproject.exception.AccessDeniedException;
import com.example.emsproject.exception.BookingNotFoundException;
import com.example.emsproject.exception.EventNotFoundException;
import com.example.emsproject.repository.BookingRepository;
import com.example.emsproject.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;
    public Booking createBooking(Long eventId, User attendee) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (event.getAvailableSlots() <= 0) {
            throw new IllegalStateException("No available slots");
        }

        // Prevent duplicate bookings
        bookingRepository.findByEventIdAndAttendeeId(eventId, attendee.getId())
                .ifPresent(b -> { throw new IllegalStateException("Already booked"); });

        Booking booking = Booking.builder()
                .event(event)
                .attendee(attendee)
                .build();

        // Update available slots
        event.setAvailableSlots(event.getAvailableSlots() - 1);
        eventRepository.save(event);
        emailService.sendBookingConfirmation(
                attendee.getEmail(),
                ""+booking.getEvent()
        );
        return bookingRepository.save(booking);
    }
    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByAttendeeId(userId);
    }
    public void cancelBooking(Long bookingId, User attendee) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (!booking.getAttendee().getId().equals(attendee.getId())) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        booking.setCancelled(true);
        bookingRepository.save(booking);

        // Free up slot
        Event event = booking.getEvent();
        event.setAvailableSlots(event.getAvailableSlots() + 1);
        eventRepository.save(event);

        // Send email (NEW)
        emailService.sendCancellationNotice(
                booking.getAttendee().getEmail(),
                booking.getEvent().getTitle()
        );
    }

}