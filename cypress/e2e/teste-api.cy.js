describe("Teste da API de Integração", () => {
  const api = "http://localhost:3000/eventos";

  const token = "authkey";

  it("Listar eventos", () => {
    cy.request({
      method: "GET",
      url: api,
      headers: {
        "x-api-token": token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("Listar evento específico", () => {
    const id = 1;
    cy.request({
      method: "GET",
      url: `${api}/${id}`,
      headers: {
        "x-api-token": token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("id", id);
    });
  });

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
      expect(response.body).to.have.property("id");
    });
  });

  it("Atualizar evento", () => {
    const id = 4;
    const eventoAtualizado = {
      // dia: "2023-10-02ZT19:24:00Z",
      // cerimonialista: "Ana Silva Atualizada",
      local: "Local Teste Atualizado",
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
      expect(response.body).to.have.property("id", id);
    });
  });
});
