import java.util.ArrayList;

public class House {
    
    private String name;
    private ArrayList<Room> rooms;
    private Menu menu;
    private ArrayList<Experience> experiences;

    public House(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public Menu getMenu() {
        return this.menu;
    }

    public void addRoom(String roomName) {
        this.rooms.add(new Room(roomName));
    }

    public void addNewGuest(String name, String roomName) {
        for (Room room: rooms) {
            if (room.getName().equals(roomName)) {
                room.addGuest(new Guest(name));
            }
        }
    }

    public void addExperience(Experience experience) {
        this.experiences.add(experience);
    }

    public void delAllRooms() {
        for (Room room: rooms) {
            room.delAllGuests();
            rooms.remove(room);
        }
    }

}
