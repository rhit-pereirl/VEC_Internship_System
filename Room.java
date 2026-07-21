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

    public void rename(String newName) {
        this.name = newName;
    }

    public void addGuest(Guest guest) {
        this.guests.add(guest);
    }

    public ArrayList<Guest> getGuests() {
        return guests;
    }

    public void delGuest(Guest guest) {
        this.guests.remove(guest);
    }

    public void delAllGuests() {
        for (Guest guest: guests) {
            this.guests.remove(guest);
        }
    }
}
