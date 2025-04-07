package com.example.emsproject.controllers;
import com.example.emsproject.entity.Event;
import com.example.emsproject.entity.EventCategory;
import com.example.emsproject.entity.User;
import com.example.emsproject.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = { "http://localhost:5500", "http://127.0.0.1:5500" }, allowCredentials = "true")
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @PostMapping
    public Event createEvent(
            @RequestBody Event event,
            @AuthenticationPrincipal User organizer
    ) {
        return eventService.createEvent(event, organizer);
    }

    @GetMapping("/my-events")
    public List<Event> getMyEvents(
            @AuthenticationPrincipal User organizer
    ) {
        return eventService.getEventsByOrganizer(organizer);
    }

    @GetMapping("/available")
    public List<Event> getAvailableEvents() {
        return eventService.getAvailableEvents();
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> cancelEventAndBookings(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User organizer
    ) {
        eventService.cancelEventAndBookings(eventId, organizer);
        return ResponseEntity.ok("Event and all associated bookings cancelled successfully");
    }

    @PutMapping("/{eventId}")
    public Event updateEvent(
            @PathVariable Long eventId,
            @RequestBody Event updatedEvent,
            @AuthenticationPrincipal User organizer
    ) {
        return eventService.updateEvent(eventId, updatedEvent, organizer);
    }
    @GetMapping("/by-category")
    public List<Event> getEventsByCategory(
            @RequestParam EventCategory category) {
        return eventService.searchByCategory(category);
    }

    // Flexible version (category optional)
    @GetMapping("/search")
    public List<Event> searchEvents(
            @RequestParam(required = false) EventCategory category) {
        return eventService.searchByCategoryNullable(category);
    }
}