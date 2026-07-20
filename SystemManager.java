
import java.util.ArrayList;

public class SystemManager {

    private ArrayList<House> houses;
    private ArrayList<Guest> guests;
    private ArrayList<Menu> menus;
    private ArrayList<MenuItem> menuItems;

    public SystemManager() {

    }


    public void setup() {
        // First House
        House cruzeiro = new House("Casa Cruzeiro");
        cruzeiro.addRoom("Suite Master");
        cruzeiro.addRoom("Suite Acerola");
        cruzeiro.addRoom("Suite Caju");
        // Second House
        House pescador = new House("Casa do Pescador");
        pescador.addRoom("Suite Master");
        pescador.addRoom("Suite Jangadeiro");
        pescador.addRoom("Suite Pescador");
        // Third House
        House areia = new House("Casa Areia Colorida");
        areia.addRoom("Suite Master");
        areia.addRoom("Suite Azul");
        areia.addRoom("Suite Verde");
        areia.addRoom("Suite Amarela");
        // Fourth House
        House estrela = new House("Casa Estrela do Mar");
        estrela.addRoom("Suite Master");
        estrela.addRoom("Suite Sereira");
        estrela.addRoom("Suite Coral");
        estrela.addRoom("Suite Ondas");
        estrela.addRoom("Suite Xie");
        // Fifth House
        House amendoeira = new House("Casa Amendoeira");
        amendoeira.addRoom("Suite Master");
        amendoeira.addRoom("Suite Pitangueira");
        amendoeira.addRoom("Suite Coqueiral");
        amendoeira.addRoom("Suite Bananeira");
        amendoeira.addRoom("Suite Cajueiro");
        // Sixth House
        House mirante = new House("Casa Mirante");
        mirante.addRoom("Suite Master");
        mirante.addRoom("Suite Estrela");
        mirante.addRoom("Suite Ancora");
        mirante.addRoom("Suite Concha");
        mirante.addRoom("Suite Varanda");
        mirante.addRoom("Suite Canoa");




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