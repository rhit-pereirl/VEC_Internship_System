import java.util.ArrayList;

public class Menu {
    private MenuType menuType;
    private ArrayList<MenuItem> menuItems;

    public void addMenuItem(MenuItem item) {
        this.menuItems.add(item);
    }

    public void delMenuItem(MenuItem item) {
        this.menuItems.remove(item);
    }

    public void setMenuType(MenuType menuType) {
        this.menuType = menuType;
    }
}
