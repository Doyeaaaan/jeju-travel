package jeju.bear.user.repository;

import jeju.bear.user.entity.Friend;
import jeju.bear.user.entity.FriendStatus;
import jeju.bear.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    @Query("""
    SELECT f FROM Friend f
    WHERE 
        ((f.requester = :userA AND f.receiver = :userB) 
        OR (f.requester = :userB AND f.receiver = :userA))
""")
    Optional<Friend> findAcceptedFriendRelation(@Param("userA") User userA, @Param("userB") User userB);

    @Query("""
    SELECT f FROM Friend f
    WHERE 
        (f.requester = :user OR f.receiver = :user)
        AND f.status = 'ACCEPTED'
""")
    List<Friend> findAcceptedFriends(@Param("user") User user);

    @Query("""
    SELECT f FROM Friend f
    WHERE 
        f.receiver = :user AND f.status = 'PENDING'
""")
    List<Friend> findReceivedRequests(@Param("user") User user);

    @Query("""
    SELECT f FROM Friend f
    WHERE 
        f.requester = :user AND f.status = 'PENDING'
""")
    List<Friend> findSentRequests(@Param("user") User user);

    boolean existsByRequesterAndReceiverAndStatus(User requester, User receiver, FriendStatus status);
    
    @Query("SELECT f FROM Friend f WHERE f.status = :status AND (f.requester = :user OR f.receiver = :user)")
    List<Friend> findAllByStatusAndRequesterOrReceiver(
            @Param("status") FriendStatus status,
            @Param("user") User user,
            @Param("user") User sameUser);
    
    List<Friend> findAllByReceiverAndStatus(User receiver, FriendStatus status);
    
    List<Friend> findAllByRequesterAndStatus(User requester, FriendStatus status);
    
    List<Friend> findAllByRequesterAndReceiverAndStatus(User requester, User receiver, FriendStatus status);
}
