package com.example.emsproject.controllers;
import com.example.emsproject.dto.EventSearchRequest;
import com.example.emsproject.entity.Event;
import com.example.emsproject.entity.EventCategory;
import com.example.emsproject.entity.User;
import com.example.emsproject.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
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
    public void cancelEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User organizer
    ) {
        eventService.cancelEvent(eventId, organizer);
    }

    @PutMapping("/{eventId}")
    public Event updateEvent(
            @PathVariable Long eventId,
            @RequestBody Event updatedEvent,
            @AuthenticationPrincipal User organizer
    ) {
        return eventService.updateEvent(eventId, updatedEvent, organizer);
    }
    // In EventController.java
    @GetMapping("/search")
    public List<Event> searchEvents(
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fromDate
    ) {
        return eventService.searchEvents(
                EventSearchRequest.builder()
                        .category(category)
                        .fromDate(fromDate)
                        .build()
        );
    }
}