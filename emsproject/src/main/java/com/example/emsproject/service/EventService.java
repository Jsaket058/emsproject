package com.example.emsproject.service;
import com.example.emsproject.dto.EventSearchRequest;
import com.example.emsproject.entity.Booking;
import com.example.emsproject.entity.Event;
import com.example.emsproject.entity.User;
import com.example.emsproject.exception.EventNotFoundException;
import com.example.emsproject.repository.BookingRepository;
import com.example.emsproject.repository.EventRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public Event createEvent(Event event, User organizer) {
        event.setOrganizer(organizer);
        event.setAvailableSlots(event.getMaxSlots());
        return eventRepository.save(event);
    }

    public List<Event> getEventsByOrganizer(User organizer) {
        return eventRepository.findByOrganizerId(organizer.getId());
    }

    public List<Event> getAvailableEvents() {
        return eventRepository.findByIsCancelledFalse();
    }


    public Event updateEvent(Long eventId, Event updatedEvent, User organizer) {
        Event existingEvent = eventRepository.findByIdAndOrganizer(eventId, organizer)
                .orElseThrow(() -> new EventNotFoundException("Event not found or unauthorized"));

        // Only allow updates to certain fields (prevent ID/organizer changes)
        existingEvent.setTitle(updatedEvent.getTitle());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setCategory(updatedEvent.getCategory());
        existingEvent.setDateTime(updatedEvent.getDateTime());

        // Recalculate slots if maxSlots changes
        if (updatedEvent.getMaxSlots() != existingEvent.getMaxSlots()) {
            int slotDifference = updatedEvent.getMaxSlots() - existingEvent.getMaxSlots();
            existingEvent.setMaxSlots(updatedEvent.getMaxSlots());
            existingEvent.setAvailableSlots(existingEvent.getAvailableSlots() + slotDifference);
        }

        return eventRepository.save(existingEvent);
    }

    @Scheduled(fixedRate = 30000)
    public void closeFullyBookedEvents() {
        eventRepository.findByAvailableSlots(0).forEach(event -> {
            if (!event.isClosed()) {
                event.setClosed(true);
                eventRepository.save(event);
                log.info("Event {} auto-closed due to full capacity", event.getId());
            }
        });
    }

    @Transactional
    public void cancelEventAndBookings(Long eventId, User organizer) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new RuntimeException("Only the event organizer can cancel this event");
        }

        // Cancel all bookings first
        List<Booking> bookings = bookingRepository.findByEventId(eventId);
        bookings.forEach(booking -> {
            booking.setCancelled(true);
            bookingRepository.save(booking);
        });

        event.setCancelled(true);
        eventRepository.save(event);
        eventRepository.delete(event);
    }
    // In EventService.java
    public List<Event> searchEvents(EventSearchRequest request) {
        return eventRepository.findByCategoryAndDateTimeAfter(
                request.getCategory(),
                request.getFromDate()
        );
    }
}