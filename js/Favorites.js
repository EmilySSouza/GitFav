import { GithubUser } from "./GithubUser.js";

export class Favorites {

  
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
    
    GithubUser.search("EmilySSouza").then(user => console.log(user));
  }
  
  checkUserLength() {
    if (this.entries.length === 0) {
      document.querySelector(".noFavorites").style.display = "flex";
    } else {
      document.querySelector(".noFavorites").style.display = "none";
    }
  }
  
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já cadastrado.");
      }

      const user = await GithubUser.search(username);

      if(user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();

    } catch(error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter((entry) => entry.login !== user.login);

    this.entries = filteredEntries;
    this.update();
    this.save();
    this.checkUserLength();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    
    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");
    const input = this.root.querySelector(".search input");
  
    addButton.onclick = () => {
      const { value } = input;
      this.add(value);
      input.value = "";  // Limpar o campo de entrada
    };
  
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const { value } = input;
        this.add(value);
        input.value = "";  // Limpar o campo de entrada
      }
    });
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createrow();

      row.querySelector(".user img").src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}/`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = `/${user.login}`;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?");

        if (isOk) {
          this.delete(user);
        }
      }

      this.tbody.append(row);
      this.checkUserLength();
    });
  }

  createrow () {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/EmilySSouza.png" alt="Imagem de EmilySSouza">
        <a href="https://github.com/EmilySSouza" target="_blank">
          <p>Emily Souza</p>
          <span>EmilySSouza</span>
        </a>
      </td>
      <td class="repositories">35</td>
      <td class="followers">4</td>
      <td>
        <button class="remove">Remover</button>
      </td>
      `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}