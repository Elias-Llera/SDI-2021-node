package com.sdi;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;
import org.codehaus.jackson.node.ObjectNode;

public class ActualizarMemoriaThread extends Thread {
	Ventana ventana;

	public ActualizarMemoriaThread(Ventana ventana) {
		this.ventana = ventana;
	}

	public void run() {
		ObjectNode respuestaJSON;
		respuestaJSON = ClientBuilder.newClient().target("http://localhost:3000/memoria").request()
				.accept(MediaType.APPLICATION_JSON).get().readEntity(ObjectNode.class);
		String memoria = respuestaJSON.get("memoria").toString();
		ventana.actualizarMemoria(memoria);
	}
}