import java.util.ArrayList;

public class Room {

    private String name;
    private ArrayList<Guest> guests;

    public Room(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void addGuest(Guest guest) {
        this.guests.add(guest);
    }
}
