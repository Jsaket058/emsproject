package com.example.emsproject.repository;

import com.example.emsproject.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByAttendeeId(Long attendeeId);

    Optional<Booking> findByEventIdAndAttendeeId(Long eventId, Long attendeeId);

    List<Booking> findByEventId(Long eventId);
}