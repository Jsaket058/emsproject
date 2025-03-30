package com.example.emsproject.controllers;

import com.example.emsproject.entity.Booking;
import com.example.emsproject.entity.User;
import com.example.emsproject.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = { "http://localhost:5500", "http://127.0.0.1:5500" }, allowCredentials = "true")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping("/{eventId}")
    public ResponseEntity<String> bookEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User attendee
    ) {
        bookingService.createBooking(eventId, attendee);
        return ResponseEntity.ok("Booking confirmed!");
    }
    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(@AuthenticationPrincipal User attendee) {
        return bookingService.getUserBookings(attendee.getId());
    }

    @DeleteMapping("/{bookingId}")
    public void cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal User attendee
    ) {
        bookingService.cancelBooking(bookingId, attendee);
    }
}
