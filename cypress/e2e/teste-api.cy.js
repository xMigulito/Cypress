describe("Testes da API de Integração - POST", () => {
  const api = "http://localhost:3000/eventos";
  const token = "authkey";

  it("Criar evento", () => {
    const novoEvento = {
      dia: "2023-10-01T19:24:00Z",
      local: "Local Teste",
      cerimonialista: "Ana Silva",
    };
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: novoEvento,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.all.keys("id", "local", "dia", "cerimonialista");
      expect(response.body).to.have.property("id").and.to.be.a("number");
      expect(response.body).to.have.property("local", novoEvento.local);
      expect(response.body).to.have.property("dia").and.to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
      expect(response.body).to.have.property("cerimonialista", novoEvento.cerimonialista);
    });
  });

  it("Criar evento com campo local vazio", () => {
    const eventoInvalido = {
      local: "",
      dia: "2023-10-01T19:24:00Z",
      cerimonialista: "Ana Silva",
    };
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: eventoInvalido,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.be.an("array").that.includes("O local não pode ser vazio");
    });
  });

  it("Criar evento com campo dia faltando", () => {
    const eventoInvalido = {
      local: "Local Teste",
      cerimonialista: "Ana Silva",
    };
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: eventoInvalido,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.be.an("array").that.includes("A data é obrigatória");
    });
  });

  it("Criar evento com tipo de dado errado", () => {
    const eventoInvalido = {
      local: 123,
      dia: "2023-10-01T19:24:00Z",
      cerimonialista: "Ana Silva",
    };
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: eventoInvalido,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.be.an("array").that.includes("O local deve ser uma string");
    });
  });

  it("Criar evento sem token", () => {
    const novoEvento = {
      local: "Local Teste",
      dia: "2023-10-01T19:24:00Z",
      cerimonialista: "Ana Silva",
    };
    cy.request({
      method: "POST",
      url: api,
      body: novoEvento,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.all.keys("id", "local", "dia", "cerimonialista");
    });
  });
});

describe("Testes da API de Integração - GET", () => {
  const api = "http://localhost:3000/eventos";
  const token = "authkey";

  beforeEach(() => {
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: {
        dia: "2023-10-01T19:24:00Z",
        local: "Local Teste",
        cerimonialista: "Ana Silva",
      },
    });
  });

  it("Listar eventos", () => {
    cy.request({
      method: "GET",
      url: api,
      headers: {
        "x-api-token": token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.all.keys("id", "local", "dia", "cerimonialista");
        expect(response.body[0].id).to.be.a("number");
        expect(response.body[0].local).to.be.a("string");
        expect(response.body[0].dia).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
        expect(response.body[0].cerimonialista).to.be.a("string");
      }
    });
  });

  it("Listar eventos sem token", () => {
    cy.request({
      method: "GET",
      url: api,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("message").and.to.include("Token não Enviado");
    });
  });

  it("Listar eventos com filtro por cerimonialista", () => {
    const filtro = "cerimonialista=Ana Silva";
    cy.request({
      method: "GET",
      url: `${api}?${filtro}`,
      headers: {
        "x-api-token": token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property("cerimonialista", "Ana Silva");
      }
    });
  });

  it("Listar eventos com filtro por local", () => {
    const filtro = "local=Salão de Festas Estrela";
    cy.request({
      method: "GET",
      url: `${api}?${filtro}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Listar eventos com filtro por dia", () => {
    const filtro = "dia=2025-06-15";
    cy.request({
      method: "GET",
      url: `${api}?${filtro}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Listar eventos com filtros combinados", () => {
    const filtro = "local=Salão de Festas Estrela&dia=2025-06-15&cerimonialista=Ana Silva";
    cy.request({
      method: "GET",
      url: `${api}?${filtro}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Listar eventos com filtros que retornam lista vazia", () => {
    const filtro = "local=Local Inexistente";
    cy.request({
      method: "GET",
      url: `${api}?${filtro}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Listar evento específico", () => {
    cy.request({
      method: "GET",
      url: `${api}/1`,
      headers: {
        "x-api-token": token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys("id", "local", "dia", "cerimonialista");
      expect(response.body).to.have.property("id", 1);
      expect(response.body.local).to.be.a("string");
      expect(response.body.dia).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
      expect(response.body.cerimonialista).to.be.a("string");
    });
  });

  it("Listar evento específico com ID inválido", () => {
    const id = 1000;
    cy.request({
      method: "GET",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Listar evento com ID não numérico", () => {
    const id = "abc";
    cy.request({
      method: "GET",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(500);
      expect(response.body).to.have.property("message");
    });
  });
});

describe("Testes da API de Integração - PATCH", () => {
  const api = "http://localhost:3000/eventos";
  const token = "authkey";

  beforeEach(() => {
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: {
        dia: "2023-10-01T19:24:00Z",
        local: "Local Teste",
        cerimonialista: "Ana Silva",
      },
    });
  });

  it("Atualizar evento", () => {
    const id = 1;
    const eventoAtualizado = {
      local: "Local Teste Atualizado",
      dia: "2023-10-02T19:24:00Z",
      cerimonialista: "Ana Silva Atualizada",
    };
    cy.request({
      method: "PATCH",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
      body: eventoAtualizado,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys("id", "local", "dia", "cerimonialista");
      expect(response.body).to.have.property("id", id);
      expect(response.body).to.have.property("local", eventoAtualizado.local);
      expect(response.body).to.have.property("dia").and.to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
      expect(response.body).to.have.property("cerimonialista", eventoAtualizado.cerimonialista);
    });
  });

  it("Atualizar evento com ID inválido", () => {
    const id = 1000;
    const eventoAtualizado = {
      local: "Local Teste Atualizado",
    };
    cy.request({
      method: "PATCH",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
      body: eventoAtualizado,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Atualizar evento com dados inválidos", () => {
  const id = 1;
  const eventoInvalido = {
    dia: "",
  };
  cy.request({
    method: "PATCH",
    url: `${api}/${id}`,
    headers: {
      "x-api-token": token,
    },
    body: eventoInvalido,
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(400);
    expect(response.body.message).to.be.an("array").that.includes("A data deve ser válida");
  });
});

  it("Atualizar evento sem token", () => {
    const id = 1;
    const eventoAtualizado = {
      local: "Local Teste Atualizado",
    };
    cy.request({
      method: "PATCH",
      url: `${api}/${id}`,
      body: eventoAtualizado,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("message", "Token não Enviado");
    });
  });
});

describe("Testes da API de Integração - DELETE", () => {
  const api = "http://localhost:3000/eventos";
  const token = "authkey";

  beforeEach(() => {
    cy.request({
      method: "POST",
      url: api,
      headers: {
        "x-api-token": token,
      },
      body: {
        dia: "2023-10-01T19:24:00Z",
        local: "Local Teste",
        cerimonialista: "Ana Silva",
      },
    });
  });

  it("Deletar evento com ID válido", () => {
    const id = 1;
    cy.request({
      method: "DELETE",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.eq("Evento removido com sucesso");
    });
  });

  it("Deletar evento com ID inválido", () => {
    const id = 1000;
    cy.request({
      method: "DELETE",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message", "Evento não encontrado");
    });
  });

  it("Deletar evento sem token", () => {
    const id = 1;
    cy.request({
      method: "DELETE",
      url: `${api}/${id}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("message", "Token não Enviado");
    });
  });
});