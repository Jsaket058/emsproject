package com.example.emsproject.repository;
import com.example.emsproject.dto.EventSearchRequest;
import com.example.emsproject.entity.Event;
import com.example.emsproject.entity.EventCategory;
import com.example.emsproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByIsCancelledFalse();
    Optional<Event> findByIdAndOrganizer(Long eventId, User organizer);
    List<Event> findByAvailableSlots(int slots);
    List<Event> findByCategoryAndDateTimeAfter(
            EventCategory category,
            LocalDateTime fromDate
    );
    @Query("SELECT e FROM Event e WHERE " +
            "(:#{#req.title} IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :#{#req.title}, '%'))) AND " +
            "(:#{#req.category} IS NULL OR e.category = :#{#req.category}) AND " +
            "(:#{#req.fromDate} IS NULL OR e.dateTime >= :#{#req.fromDate})")
    List<Event> searchEvents(@Param("req") EventSearchRequest request);
}
