
import java.util.ArrayList;

public class SystemManager {

    private ArrayList<House> houses;
    private ArrayList<Guest> guests;
    private ArrayList<Menu> menus;
    private ArrayList<MenuItem> menuItems;
    // Experiences are like yoga classes, surfing classes, fishing trips, etc
    private ArrayList<Experience> allExperiences;

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
        // Seventh House
        House corais = new House("Casa dos Corais");
        corais.addRoom("Suite Master");
        corais.addRoom("Suite Dourado");
        corais.addRoom("Suite Robalo");
        corais.addRoom("Suite Carapeba");
        corais.addRoom("Suite Cumurupim");
        corais.addRoom("Suite Xareu");
        corais.addRoom("Suite Cioba");
        corais.addRoom("Suite Pampo");
        corais.addRoom("Suite Pescada");
        corais.addRoom("Suite Beijupira");

        this.houses.add(cruzeiro);
        this.houses.add(pescador);
        this.houses.add(areia);
        this.houses.add(estrela);
        this.houses.add(amendoeira);
        this.houses.add(mirante);
        this.houses.add(corais);
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

    public void addFood(String name, float cost) {
        menuItems.add(new Food(name, cost));
    }

    public void addBeverage(String name, float cost) {
        menuItems.add(new Beverage(name, cost));
    }

    public void addExperience(String name, float cost) {
        allExperiences.add(new Experience(name, cost));
    }

    public void addGuest(String name) {
        guests.add(new Guest(name));
    }

}