import { Injectable, NotFoundException } from '@nestjs/common';
import { Consumer } from './consumo_agua.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConsumoAguaService {

    constructor(@InjectModel('Consumer') private readonly consumerModel: Model<Consumer> ) {}

    
    async createConsumer(consumer: Consumer){
        const consumerModel = new this.consumerModel(
            {
                consumerId: consumer.consumerId,
                waterConsumed: consumer.waterConsumed,
                date: consumer.date
            }
    );
        const result = await consumerModel.save();
        return result.id as string;
    }

    async readAllConsumers(){
        const allConsumersData = await this.consumerModel.find().exec();
        return allConsumersData;
    }

    async readConsumersBills(consumerId: string) {
        const id = String(consumerId)
        const readConsumersBillsList = await this.consumerModel.find({ consumerId: id }).exec()
        return readConsumersBillsList
    }

    async readSelectedDates(consumerId: string, firstDate: string, secondDate: string) {
        
        const startDate = new Date(`${firstDate}T00:00:00Z`);
        const endDate = new Date(`${secondDate}T23:59:59Z`);
    
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Datas inválidas fornecidas. Por favor, utilize o formato YYYY-MM-DD.');
        }
    
        
        try {
            const consumerSelectedDate = await this.consumerModel.find({
                consumerId: consumerId,
                date: { $gte: startDate, $lt: endDate }
            }).exec();
            
            return consumerSelectedDate;
        } catch (error) {
            console.error('Erro ao buscar dados no intervalo de datas:', error);
            throw new Error('Erro ao buscar dados no intervalo de datas.');
        }
    }

    async updateConsumer(consumer: Consumer){
        const updatedConsumer = await this.consumerModel.findOne({consumerId: consumer.consumerId});
        if(!updatedConsumer){
            throw new NotFoundException('Não foi possível encontrar o consumo');
        }
        if(consumer.consumerId){
            updatedConsumer.consumerId = consumer.consumerId
        }
        if(consumer.date){
            updatedConsumer.date = consumer.date
        }
        if(consumer.waterConsumed){
            updatedConsumer.waterConsumed = consumer.waterConsumed
        }
        updatedConsumer.save()
    }

    async checkHighConsumptionAlert(consumerId: string){
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
       
        if (isNaN(startOfThisMonth.getTime()) || isNaN(startOfLastMonth.getTime())) {
            throw new Error('Erro ao calcular as datas. Uma ou mais datas são inválidas.');
        }
    
        try {
            
            const lastMonthConsumption = await this.consumerModel
                .findOne({
                    consumerId,
                    date: { $gte: startOfLastMonth, $lt: startOfThisMonth }
                })
                .exec();
    
                
                if (!lastMonthConsumption) {
                    return null; 
                }
                console.log('Consumo do Último Mês:', lastMonthConsumption.waterConsumed);
    
            
            const currentMonthConsumption = await this.consumerModel
                .findOne({
                    consumerId,
                    date: { $gte: startOfThisMonth }
                })
                .exec();
    
                
                if (!currentMonthConsumption) {
                    return null; 
                }
                console.log('Consumo do mês Atual:', currentMonthConsumption.waterConsumed);
    
            
            if (currentMonthConsumption.waterConsumed > lastMonthConsumption.waterConsumed) {
                return 'Alerta: Consumo alto! O consumo deste mês é maior que o do mês passado.';
            }
    
            return null; 
        } catch (error) {
            console.error('Erro ao buscar consumos:', error);
            throw new Error('Erro ao buscar dados de consumo.');
        }
    }
    

    async deleteConsumer(id: number){
        const result = await this.consumerModel.deleteOne({_id: id});
    }

}
