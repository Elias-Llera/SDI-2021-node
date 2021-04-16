package com.sdi;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;
import javax.swing.border.EmptyBorder;

public class Ventana {
	JFrame frame;
	JPanel panel;
	JButton botonActualizar;
	JButton botonApagar;
	public JLabel textoMemoria;
	int peticiones = 0;

	public static void main(String[] args) throws InterruptedException {
		new Ventana();
	}

	public Ventana() {
		// Frame
		frame = new JFrame("Aplicación Monitorización");
		frame.setSize(500, 200);
		frame.setLocationRelativeTo(null);
		
		// Panel
		panel = new JPanel();
		panel.setBorder(new EmptyBorder(10, 10, 10, 10));
		panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
		frame.add(panel);
		
		// Botón Actualizar
		botonActualizar = new JButton("Actualizar Memoria");
		botonActualizar.setBorder(new EmptyBorder(10, 10, 10, 10));
		botonActualizar.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				peticiones++;
				ActualizarMemoriaThread hilo = new ActualizarMemoriaThread(Ventana.this);
				hilo.start();
				}
			});
		panel.add(botonActualizar);
		
		//Botón Actualizar
		botonApagar = new JButton("Apagar Equipo");
		botonApagar.setBorder(new EmptyBorder(10, 10, 10, 10));
		botonApagar.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				JOptionPane.showMessageDialog(frame, "Enviado apagar!");
			}
		});
		panel.add(botonApagar);

		// Texto memoria
		textoMemoria=new JLabel();
		textoMemoria.setBorder(new EmptyBorder(10,10,10,10));
		textoMemoria.setText("Memoria libre:");
		panel.add(textoMemoria);

		// Propiedades visibilidad frame
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setVisible(true);
	}
	
	public void actualizarMemoria(String memoria) {
		SwingUtilities.invokeLater(new Runnable(){
			public void run(){
				textoMemoria.setText("Memoria libre: "+memoria +" ("+peticiones+")");
			}
		});
	}

}