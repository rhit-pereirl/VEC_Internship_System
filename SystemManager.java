
import java.util.ArrayList;

public class SystemManager {

    private ArrayList<House> houses;
    private ArrayList<Guest> guests;
    private ArrayList<Menu> menus;
    private ArrayList<MenuItem> menuItems;

    public SystemManager() {

    }

    public void delHome(String home) {
        for (House house: houses) {
            if (house.getName().equals(home)) {
                houses.remove(house);
            }
        }
    }

    public Menu getHouseMenu(String home) {
        for (House house: houses) {
            if (house.getName().equals(home)) {
                return house.getMenu();
            }
        }
        throw new Error("House Not Found");
    }

    public void addNewMenu(MenuType menuType) {
        menus.add(new Menu(menuType));
    }

}